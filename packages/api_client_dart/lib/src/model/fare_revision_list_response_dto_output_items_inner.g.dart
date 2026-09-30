// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'fare_revision_list_response_dto_output_items_inner.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const FareRevisionListResponseDtoOutputItemsInnerActionEnum
    _$fareRevisionListResponseDtoOutputItemsInnerActionEnum_farePeriodCreate =
    const FareRevisionListResponseDtoOutputItemsInnerActionEnum._(
        'farePeriodCreate');
const FareRevisionListResponseDtoOutputItemsInnerActionEnum
    _$fareRevisionListResponseDtoOutputItemsInnerActionEnum_farePeriodUpdate =
    const FareRevisionListResponseDtoOutputItemsInnerActionEnum._(
        'farePeriodUpdate');

FareRevisionListResponseDtoOutputItemsInnerActionEnum
    _$fareRevisionListResponseDtoOutputItemsInnerActionEnumValueOf(
        String name) {
  switch (name) {
    case 'farePeriodCreate':
      return _$fareRevisionListResponseDtoOutputItemsInnerActionEnum_farePeriodCreate;
    case 'farePeriodUpdate':
      return _$fareRevisionListResponseDtoOutputItemsInnerActionEnum_farePeriodUpdate;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<FareRevisionListResponseDtoOutputItemsInnerActionEnum>
    _$fareRevisionListResponseDtoOutputItemsInnerActionEnumValues = BuiltSet<
        FareRevisionListResponseDtoOutputItemsInnerActionEnum>(const <FareRevisionListResponseDtoOutputItemsInnerActionEnum>[
  _$fareRevisionListResponseDtoOutputItemsInnerActionEnum_farePeriodCreate,
  _$fareRevisionListResponseDtoOutputItemsInnerActionEnum_farePeriodUpdate,
]);

Serializer<FareRevisionListResponseDtoOutputItemsInnerActionEnum>
    _$fareRevisionListResponseDtoOutputItemsInnerActionEnumSerializer =
    _$FareRevisionListResponseDtoOutputItemsInnerActionEnumSerializer();

class _$FareRevisionListResponseDtoOutputItemsInnerActionEnumSerializer
    implements
        PrimitiveSerializer<
            FareRevisionListResponseDtoOutputItemsInnerActionEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'farePeriodCreate': 'fare.create',
    'farePeriodUpdate': 'fare.update',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'fare.create': 'farePeriodCreate',
    'fare.update': 'farePeriodUpdate',
  };

  @override
  final Iterable<Type> types = const <Type>[
    FareRevisionListResponseDtoOutputItemsInnerActionEnum
  ];
  @override
  final String wireName =
      'FareRevisionListResponseDtoOutputItemsInnerActionEnum';

  @override
  Object serialize(Serializers serializers,
          FareRevisionListResponseDtoOutputItemsInnerActionEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  FareRevisionListResponseDtoOutputItemsInnerActionEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      FareRevisionListResponseDtoOutputItemsInnerActionEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$FareRevisionListResponseDtoOutputItemsInner
    extends FareRevisionListResponseDtoOutputItemsInner {
  @override
  final FareRevisionListResponseDtoOutputItemsInnerActionEnum action;
  @override
  final String? actorId;
  @override
  final DateTime createdAt;
  @override
  final FareRevisionListResponseDtoOutputItemsInnerBefore? before;
  @override
  final FareRevisionListResponseDtoOutputItemsInnerAfter after;

  factory _$FareRevisionListResponseDtoOutputItemsInner(
          [void Function(FareRevisionListResponseDtoOutputItemsInnerBuilder)?
              updates]) =>
      (FareRevisionListResponseDtoOutputItemsInnerBuilder()..update(updates))
          ._build();

  _$FareRevisionListResponseDtoOutputItemsInner._(
      {required this.action,
      this.actorId,
      required this.createdAt,
      this.before,
      required this.after})
      : super._();
  @override
  FareRevisionListResponseDtoOutputItemsInner rebuild(
          void Function(FareRevisionListResponseDtoOutputItemsInnerBuilder)
              updates) =>
      (toBuilder()..update(updates)).build();

  @override
  FareRevisionListResponseDtoOutputItemsInnerBuilder toBuilder() =>
      FareRevisionListResponseDtoOutputItemsInnerBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is FareRevisionListResponseDtoOutputItemsInner &&
        action == other.action &&
        actorId == other.actorId &&
        createdAt == other.createdAt &&
        before == other.before &&
        after == other.after;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, action.hashCode);
    _$hash = $jc(_$hash, actorId.hashCode);
    _$hash = $jc(_$hash, createdAt.hashCode);
    _$hash = $jc(_$hash, before.hashCode);
    _$hash = $jc(_$hash, after.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(
            r'FareRevisionListResponseDtoOutputItemsInner')
          ..add('action', action)
          ..add('actorId', actorId)
          ..add('createdAt', createdAt)
          ..add('before', before)
          ..add('after', after))
        .toString();
  }
}

class FareRevisionListResponseDtoOutputItemsInnerBuilder
    implements
        Builder<FareRevisionListResponseDtoOutputItemsInner,
            FareRevisionListResponseDtoOutputItemsInnerBuilder> {
  _$FareRevisionListResponseDtoOutputItemsInner? _$v;

  FareRevisionListResponseDtoOutputItemsInnerActionEnum? _action;
  FareRevisionListResponseDtoOutputItemsInnerActionEnum? get action =>
      _$this._action;
  set action(FareRevisionListResponseDtoOutputItemsInnerActionEnum? action) =>
      _$this._action = action;

  String? _actorId;
  String? get actorId => _$this._actorId;
  set actorId(String? actorId) => _$this._actorId = actorId;

  DateTime? _createdAt;
  DateTime? get createdAt => _$this._createdAt;
  set createdAt(DateTime? createdAt) => _$this._createdAt = createdAt;

  FareRevisionListResponseDtoOutputItemsInnerBeforeBuilder? _before;
  FareRevisionListResponseDtoOutputItemsInnerBeforeBuilder get before =>
      _$this._before ??=
          FareRevisionListResponseDtoOutputItemsInnerBeforeBuilder();
  set before(
          FareRevisionListResponseDtoOutputItemsInnerBeforeBuilder? before) =>
      _$this._before = before;

  FareRevisionListResponseDtoOutputItemsInnerAfterBuilder? _after;
  FareRevisionListResponseDtoOutputItemsInnerAfterBuilder get after =>
      _$this._after ??=
          FareRevisionListResponseDtoOutputItemsInnerAfterBuilder();
  set after(FareRevisionListResponseDtoOutputItemsInnerAfterBuilder? after) =>
      _$this._after = after;

  FareRevisionListResponseDtoOutputItemsInnerBuilder() {
    FareRevisionListResponseDtoOutputItemsInner._defaults(this);
  }

  FareRevisionListResponseDtoOutputItemsInnerBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _action = $v.action;
      _actorId = $v.actorId;
      _createdAt = $v.createdAt;
      _before = $v.before?.toBuilder();
      _after = $v.after.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(FareRevisionListResponseDtoOutputItemsInner other) {
    _$v = other as _$FareRevisionListResponseDtoOutputItemsInner;
  }

  @override
  void update(
      void Function(FareRevisionListResponseDtoOutputItemsInnerBuilder)?
          updates) {
    if (updates != null) updates(this);
  }

  @override
  FareRevisionListResponseDtoOutputItemsInner build() => _build();

  _$FareRevisionListResponseDtoOutputItemsInner _build() {
    _$FareRevisionListResponseDtoOutputItemsInner _$result;
    try {
      _$result = _$v ??
          _$FareRevisionListResponseDtoOutputItemsInner._(
            action: BuiltValueNullFieldError.checkNotNull(action,
                r'FareRevisionListResponseDtoOutputItemsInner', 'action'),
            actorId: actorId,
            createdAt: BuiltValueNullFieldError.checkNotNull(createdAt,
                r'FareRevisionListResponseDtoOutputItemsInner', 'createdAt'),
            before: _before?.build(),
            after: after.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'before';
        _before?.build();
        _$failedField = 'after';
        after.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'FareRevisionListResponseDtoOutputItemsInner',
            _$failedField,
            e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
