// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'fare_list_response_dto_output_items_inner.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const FareListResponseDtoOutputItemsInnerStatusEnum
    _$fareListResponseDtoOutputItemsInnerStatusEnum_ACTIVE =
    const FareListResponseDtoOutputItemsInnerStatusEnum._('ACTIVE');
const FareListResponseDtoOutputItemsInnerStatusEnum
    _$fareListResponseDtoOutputItemsInnerStatusEnum_INACTIVE =
    const FareListResponseDtoOutputItemsInnerStatusEnum._('INACTIVE');

FareListResponseDtoOutputItemsInnerStatusEnum
    _$fareListResponseDtoOutputItemsInnerStatusEnumValueOf(String name) {
  switch (name) {
    case 'ACTIVE':
      return _$fareListResponseDtoOutputItemsInnerStatusEnum_ACTIVE;
    case 'INACTIVE':
      return _$fareListResponseDtoOutputItemsInnerStatusEnum_INACTIVE;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<FareListResponseDtoOutputItemsInnerStatusEnum>
    _$fareListResponseDtoOutputItemsInnerStatusEnumValues = BuiltSet<
        FareListResponseDtoOutputItemsInnerStatusEnum>(const <FareListResponseDtoOutputItemsInnerStatusEnum>[
  _$fareListResponseDtoOutputItemsInnerStatusEnum_ACTIVE,
  _$fareListResponseDtoOutputItemsInnerStatusEnum_INACTIVE,
]);

Serializer<FareListResponseDtoOutputItemsInnerStatusEnum>
    _$fareListResponseDtoOutputItemsInnerStatusEnumSerializer =
    _$FareListResponseDtoOutputItemsInnerStatusEnumSerializer();

class _$FareListResponseDtoOutputItemsInnerStatusEnumSerializer
    implements
        PrimitiveSerializer<FareListResponseDtoOutputItemsInnerStatusEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'ACTIVE': 'ACTIVE',
    'INACTIVE': 'INACTIVE',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'ACTIVE': 'ACTIVE',
    'INACTIVE': 'INACTIVE',
  };

  @override
  final Iterable<Type> types = const <Type>[
    FareListResponseDtoOutputItemsInnerStatusEnum
  ];
  @override
  final String wireName = 'FareListResponseDtoOutputItemsInnerStatusEnum';

  @override
  Object serialize(Serializers serializers,
          FareListResponseDtoOutputItemsInnerStatusEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  FareListResponseDtoOutputItemsInnerStatusEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      FareListResponseDtoOutputItemsInnerStatusEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$FareListResponseDtoOutputItemsInner
    extends FareListResponseDtoOutputItemsInner {
  @override
  final String id;
  @override
  final String routeId;
  @override
  final String routeName;
  @override
  final FareListResponseDtoOutputItemsInnerStatusEnum status;
  @override
  final DateTime createdAt;
  @override
  final DateTime updatedAt;
  @override
  final int ruleCount;

  factory _$FareListResponseDtoOutputItemsInner(
          [void Function(FareListResponseDtoOutputItemsInnerBuilder)?
              updates]) =>
      (FareListResponseDtoOutputItemsInnerBuilder()..update(updates))._build();

  _$FareListResponseDtoOutputItemsInner._(
      {required this.id,
      required this.routeId,
      required this.routeName,
      required this.status,
      required this.createdAt,
      required this.updatedAt,
      required this.ruleCount})
      : super._();
  @override
  FareListResponseDtoOutputItemsInner rebuild(
          void Function(FareListResponseDtoOutputItemsInnerBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  FareListResponseDtoOutputItemsInnerBuilder toBuilder() =>
      FareListResponseDtoOutputItemsInnerBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is FareListResponseDtoOutputItemsInner &&
        id == other.id &&
        routeId == other.routeId &&
        routeName == other.routeName &&
        status == other.status &&
        createdAt == other.createdAt &&
        updatedAt == other.updatedAt &&
        ruleCount == other.ruleCount;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, routeId.hashCode);
    _$hash = $jc(_$hash, routeName.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, createdAt.hashCode);
    _$hash = $jc(_$hash, updatedAt.hashCode);
    _$hash = $jc(_$hash, ruleCount.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'FareListResponseDtoOutputItemsInner')
          ..add('id', id)
          ..add('routeId', routeId)
          ..add('routeName', routeName)
          ..add('status', status)
          ..add('createdAt', createdAt)
          ..add('updatedAt', updatedAt)
          ..add('ruleCount', ruleCount))
        .toString();
  }
}

class FareListResponseDtoOutputItemsInnerBuilder
    implements
        Builder<FareListResponseDtoOutputItemsInner,
            FareListResponseDtoOutputItemsInnerBuilder> {
  _$FareListResponseDtoOutputItemsInner? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _routeId;
  String? get routeId => _$this._routeId;
  set routeId(String? routeId) => _$this._routeId = routeId;

  String? _routeName;
  String? get routeName => _$this._routeName;
  set routeName(String? routeName) => _$this._routeName = routeName;

  FareListResponseDtoOutputItemsInnerStatusEnum? _status;
  FareListResponseDtoOutputItemsInnerStatusEnum? get status => _$this._status;
  set status(FareListResponseDtoOutputItemsInnerStatusEnum? status) =>
      _$this._status = status;

  DateTime? _createdAt;
  DateTime? get createdAt => _$this._createdAt;
  set createdAt(DateTime? createdAt) => _$this._createdAt = createdAt;

  DateTime? _updatedAt;
  DateTime? get updatedAt => _$this._updatedAt;
  set updatedAt(DateTime? updatedAt) => _$this._updatedAt = updatedAt;

  int? _ruleCount;
  int? get ruleCount => _$this._ruleCount;
  set ruleCount(int? ruleCount) => _$this._ruleCount = ruleCount;

  FareListResponseDtoOutputItemsInnerBuilder() {
    FareListResponseDtoOutputItemsInner._defaults(this);
  }

  FareListResponseDtoOutputItemsInnerBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _routeId = $v.routeId;
      _routeName = $v.routeName;
      _status = $v.status;
      _createdAt = $v.createdAt;
      _updatedAt = $v.updatedAt;
      _ruleCount = $v.ruleCount;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(FareListResponseDtoOutputItemsInner other) {
    _$v = other as _$FareListResponseDtoOutputItemsInner;
  }

  @override
  void update(
      void Function(FareListResponseDtoOutputItemsInnerBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  FareListResponseDtoOutputItemsInner build() => _build();

  _$FareListResponseDtoOutputItemsInner _build() {
    final _$result = _$v ??
        _$FareListResponseDtoOutputItemsInner._(
          id: BuiltValueNullFieldError.checkNotNull(
              id, r'FareListResponseDtoOutputItemsInner', 'id'),
          routeId: BuiltValueNullFieldError.checkNotNull(
              routeId, r'FareListResponseDtoOutputItemsInner', 'routeId'),
          routeName: BuiltValueNullFieldError.checkNotNull(
              routeName, r'FareListResponseDtoOutputItemsInner', 'routeName'),
          status: BuiltValueNullFieldError.checkNotNull(
              status, r'FareListResponseDtoOutputItemsInner', 'status'),
          createdAt: BuiltValueNullFieldError.checkNotNull(
              createdAt, r'FareListResponseDtoOutputItemsInner', 'createdAt'),
          updatedAt: BuiltValueNullFieldError.checkNotNull(
              updatedAt, r'FareListResponseDtoOutputItemsInner', 'updatedAt'),
          ruleCount: BuiltValueNullFieldError.checkNotNull(
              ruleCount, r'FareListResponseDtoOutputItemsInner', 'ruleCount'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
