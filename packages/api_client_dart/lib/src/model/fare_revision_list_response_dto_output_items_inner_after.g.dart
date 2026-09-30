// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'fare_revision_list_response_dto_output_items_inner_after.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const FareRevisionListResponseDtoOutputItemsInnerAfterStatusEnum
    _$fareRevisionListResponseDtoOutputItemsInnerAfterStatusEnum_ACTIVE =
    const FareRevisionListResponseDtoOutputItemsInnerAfterStatusEnum._(
        'ACTIVE');
const FareRevisionListResponseDtoOutputItemsInnerAfterStatusEnum
    _$fareRevisionListResponseDtoOutputItemsInnerAfterStatusEnum_INACTIVE =
    const FareRevisionListResponseDtoOutputItemsInnerAfterStatusEnum._(
        'INACTIVE');

FareRevisionListResponseDtoOutputItemsInnerAfterStatusEnum
    _$fareRevisionListResponseDtoOutputItemsInnerAfterStatusEnumValueOf(
        String name) {
  switch (name) {
    case 'ACTIVE':
      return _$fareRevisionListResponseDtoOutputItemsInnerAfterStatusEnum_ACTIVE;
    case 'INACTIVE':
      return _$fareRevisionListResponseDtoOutputItemsInnerAfterStatusEnum_INACTIVE;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<FareRevisionListResponseDtoOutputItemsInnerAfterStatusEnum>
    _$fareRevisionListResponseDtoOutputItemsInnerAfterStatusEnumValues =
    BuiltSet<
        FareRevisionListResponseDtoOutputItemsInnerAfterStatusEnum>(const <FareRevisionListResponseDtoOutputItemsInnerAfterStatusEnum>[
  _$fareRevisionListResponseDtoOutputItemsInnerAfterStatusEnum_ACTIVE,
  _$fareRevisionListResponseDtoOutputItemsInnerAfterStatusEnum_INACTIVE,
]);

Serializer<FareRevisionListResponseDtoOutputItemsInnerAfterStatusEnum>
    _$fareRevisionListResponseDtoOutputItemsInnerAfterStatusEnumSerializer =
    _$FareRevisionListResponseDtoOutputItemsInnerAfterStatusEnumSerializer();

class _$FareRevisionListResponseDtoOutputItemsInnerAfterStatusEnumSerializer
    implements
        PrimitiveSerializer<
            FareRevisionListResponseDtoOutputItemsInnerAfterStatusEnum> {
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
    FareRevisionListResponseDtoOutputItemsInnerAfterStatusEnum
  ];
  @override
  final String wireName =
      'FareRevisionListResponseDtoOutputItemsInnerAfterStatusEnum';

  @override
  Object serialize(Serializers serializers,
          FareRevisionListResponseDtoOutputItemsInnerAfterStatusEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  FareRevisionListResponseDtoOutputItemsInnerAfterStatusEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      FareRevisionListResponseDtoOutputItemsInnerAfterStatusEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$FareRevisionListResponseDtoOutputItemsInnerAfter
    extends FareRevisionListResponseDtoOutputItemsInnerAfter {
  @override
  final String routeId;
  @override
  final FareRevisionListResponseDtoOutputItemsInnerAfterStatusEnum status;
  @override
  final String? note;
  @override
  final BuiltList<FareResponseDtoOutputRulesInner> rules;

  factory _$FareRevisionListResponseDtoOutputItemsInnerAfter(
          [void Function(
                  FareRevisionListResponseDtoOutputItemsInnerAfterBuilder)?
              updates]) =>
      (FareRevisionListResponseDtoOutputItemsInnerAfterBuilder()
            ..update(updates))
          ._build();

  _$FareRevisionListResponseDtoOutputItemsInnerAfter._(
      {required this.routeId,
      required this.status,
      this.note,
      required this.rules})
      : super._();
  @override
  FareRevisionListResponseDtoOutputItemsInnerAfter rebuild(
          void Function(FareRevisionListResponseDtoOutputItemsInnerAfterBuilder)
              updates) =>
      (toBuilder()..update(updates)).build();

  @override
  FareRevisionListResponseDtoOutputItemsInnerAfterBuilder toBuilder() =>
      FareRevisionListResponseDtoOutputItemsInnerAfterBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is FareRevisionListResponseDtoOutputItemsInnerAfter &&
        routeId == other.routeId &&
        status == other.status &&
        note == other.note &&
        rules == other.rules;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, routeId.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, note.hashCode);
    _$hash = $jc(_$hash, rules.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(
            r'FareRevisionListResponseDtoOutputItemsInnerAfter')
          ..add('routeId', routeId)
          ..add('status', status)
          ..add('note', note)
          ..add('rules', rules))
        .toString();
  }
}

class FareRevisionListResponseDtoOutputItemsInnerAfterBuilder
    implements
        Builder<FareRevisionListResponseDtoOutputItemsInnerAfter,
            FareRevisionListResponseDtoOutputItemsInnerAfterBuilder> {
  _$FareRevisionListResponseDtoOutputItemsInnerAfter? _$v;

  String? _routeId;
  String? get routeId => _$this._routeId;
  set routeId(String? routeId) => _$this._routeId = routeId;

  FareRevisionListResponseDtoOutputItemsInnerAfterStatusEnum? _status;
  FareRevisionListResponseDtoOutputItemsInnerAfterStatusEnum? get status =>
      _$this._status;
  set status(
          FareRevisionListResponseDtoOutputItemsInnerAfterStatusEnum? status) =>
      _$this._status = status;

  String? _note;
  String? get note => _$this._note;
  set note(String? note) => _$this._note = note;

  ListBuilder<FareResponseDtoOutputRulesInner>? _rules;
  ListBuilder<FareResponseDtoOutputRulesInner> get rules =>
      _$this._rules ??= ListBuilder<FareResponseDtoOutputRulesInner>();
  set rules(ListBuilder<FareResponseDtoOutputRulesInner>? rules) =>
      _$this._rules = rules;

  FareRevisionListResponseDtoOutputItemsInnerAfterBuilder() {
    FareRevisionListResponseDtoOutputItemsInnerAfter._defaults(this);
  }

  FareRevisionListResponseDtoOutputItemsInnerAfterBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _routeId = $v.routeId;
      _status = $v.status;
      _note = $v.note;
      _rules = $v.rules.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(FareRevisionListResponseDtoOutputItemsInnerAfter other) {
    _$v = other as _$FareRevisionListResponseDtoOutputItemsInnerAfter;
  }

  @override
  void update(
      void Function(FareRevisionListResponseDtoOutputItemsInnerAfterBuilder)?
          updates) {
    if (updates != null) updates(this);
  }

  @override
  FareRevisionListResponseDtoOutputItemsInnerAfter build() => _build();

  _$FareRevisionListResponseDtoOutputItemsInnerAfter _build() {
    _$FareRevisionListResponseDtoOutputItemsInnerAfter _$result;
    try {
      _$result = _$v ??
          _$FareRevisionListResponseDtoOutputItemsInnerAfter._(
            routeId: BuiltValueNullFieldError.checkNotNull(routeId,
                r'FareRevisionListResponseDtoOutputItemsInnerAfter', 'routeId'),
            status: BuiltValueNullFieldError.checkNotNull(status,
                r'FareRevisionListResponseDtoOutputItemsInnerAfter', 'status'),
            note: note,
            rules: rules.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'rules';
        rules.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'FareRevisionListResponseDtoOutputItemsInnerAfter',
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
