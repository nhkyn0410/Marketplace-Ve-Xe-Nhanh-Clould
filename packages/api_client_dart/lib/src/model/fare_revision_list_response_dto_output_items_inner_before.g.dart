// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'fare_revision_list_response_dto_output_items_inner_before.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const FareRevisionListResponseDtoOutputItemsInnerBeforeStatusEnum
    _$fareRevisionListResponseDtoOutputItemsInnerBeforeStatusEnum_ACTIVE =
    const FareRevisionListResponseDtoOutputItemsInnerBeforeStatusEnum._(
        'ACTIVE');
const FareRevisionListResponseDtoOutputItemsInnerBeforeStatusEnum
    _$fareRevisionListResponseDtoOutputItemsInnerBeforeStatusEnum_INACTIVE =
    const FareRevisionListResponseDtoOutputItemsInnerBeforeStatusEnum._(
        'INACTIVE');

FareRevisionListResponseDtoOutputItemsInnerBeforeStatusEnum
    _$fareRevisionListResponseDtoOutputItemsInnerBeforeStatusEnumValueOf(
        String name) {
  switch (name) {
    case 'ACTIVE':
      return _$fareRevisionListResponseDtoOutputItemsInnerBeforeStatusEnum_ACTIVE;
    case 'INACTIVE':
      return _$fareRevisionListResponseDtoOutputItemsInnerBeforeStatusEnum_INACTIVE;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<FareRevisionListResponseDtoOutputItemsInnerBeforeStatusEnum>
    _$fareRevisionListResponseDtoOutputItemsInnerBeforeStatusEnumValues =
    BuiltSet<
        FareRevisionListResponseDtoOutputItemsInnerBeforeStatusEnum>(const <FareRevisionListResponseDtoOutputItemsInnerBeforeStatusEnum>[
  _$fareRevisionListResponseDtoOutputItemsInnerBeforeStatusEnum_ACTIVE,
  _$fareRevisionListResponseDtoOutputItemsInnerBeforeStatusEnum_INACTIVE,
]);

Serializer<FareRevisionListResponseDtoOutputItemsInnerBeforeStatusEnum>
    _$fareRevisionListResponseDtoOutputItemsInnerBeforeStatusEnumSerializer =
    _$FareRevisionListResponseDtoOutputItemsInnerBeforeStatusEnumSerializer();

class _$FareRevisionListResponseDtoOutputItemsInnerBeforeStatusEnumSerializer
    implements
        PrimitiveSerializer<
            FareRevisionListResponseDtoOutputItemsInnerBeforeStatusEnum> {
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
    FareRevisionListResponseDtoOutputItemsInnerBeforeStatusEnum
  ];
  @override
  final String wireName =
      'FareRevisionListResponseDtoOutputItemsInnerBeforeStatusEnum';

  @override
  Object serialize(Serializers serializers,
          FareRevisionListResponseDtoOutputItemsInnerBeforeStatusEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  FareRevisionListResponseDtoOutputItemsInnerBeforeStatusEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      FareRevisionListResponseDtoOutputItemsInnerBeforeStatusEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$FareRevisionListResponseDtoOutputItemsInnerBefore
    extends FareRevisionListResponseDtoOutputItemsInnerBefore {
  @override
  final String routeId;
  @override
  final FareRevisionListResponseDtoOutputItemsInnerBeforeStatusEnum status;
  @override
  final String? note;
  @override
  final BuiltList<FareResponseDtoOutputRulesInner> rules;

  factory _$FareRevisionListResponseDtoOutputItemsInnerBefore(
          [void Function(
                  FareRevisionListResponseDtoOutputItemsInnerBeforeBuilder)?
              updates]) =>
      (FareRevisionListResponseDtoOutputItemsInnerBeforeBuilder()
            ..update(updates))
          ._build();

  _$FareRevisionListResponseDtoOutputItemsInnerBefore._(
      {required this.routeId,
      required this.status,
      this.note,
      required this.rules})
      : super._();
  @override
  FareRevisionListResponseDtoOutputItemsInnerBefore rebuild(
          void Function(
                  FareRevisionListResponseDtoOutputItemsInnerBeforeBuilder)
              updates) =>
      (toBuilder()..update(updates)).build();

  @override
  FareRevisionListResponseDtoOutputItemsInnerBeforeBuilder toBuilder() =>
      FareRevisionListResponseDtoOutputItemsInnerBeforeBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is FareRevisionListResponseDtoOutputItemsInnerBefore &&
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
            r'FareRevisionListResponseDtoOutputItemsInnerBefore')
          ..add('routeId', routeId)
          ..add('status', status)
          ..add('note', note)
          ..add('rules', rules))
        .toString();
  }
}

class FareRevisionListResponseDtoOutputItemsInnerBeforeBuilder
    implements
        Builder<FareRevisionListResponseDtoOutputItemsInnerBefore,
            FareRevisionListResponseDtoOutputItemsInnerBeforeBuilder> {
  _$FareRevisionListResponseDtoOutputItemsInnerBefore? _$v;

  String? _routeId;
  String? get routeId => _$this._routeId;
  set routeId(String? routeId) => _$this._routeId = routeId;

  FareRevisionListResponseDtoOutputItemsInnerBeforeStatusEnum? _status;
  FareRevisionListResponseDtoOutputItemsInnerBeforeStatusEnum? get status =>
      _$this._status;
  set status(
          FareRevisionListResponseDtoOutputItemsInnerBeforeStatusEnum?
              status) =>
      _$this._status = status;

  String? _note;
  String? get note => _$this._note;
  set note(String? note) => _$this._note = note;

  ListBuilder<FareResponseDtoOutputRulesInner>? _rules;
  ListBuilder<FareResponseDtoOutputRulesInner> get rules =>
      _$this._rules ??= ListBuilder<FareResponseDtoOutputRulesInner>();
  set rules(ListBuilder<FareResponseDtoOutputRulesInner>? rules) =>
      _$this._rules = rules;

  FareRevisionListResponseDtoOutputItemsInnerBeforeBuilder() {
    FareRevisionListResponseDtoOutputItemsInnerBefore._defaults(this);
  }

  FareRevisionListResponseDtoOutputItemsInnerBeforeBuilder get _$this {
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
  void replace(FareRevisionListResponseDtoOutputItemsInnerBefore other) {
    _$v = other as _$FareRevisionListResponseDtoOutputItemsInnerBefore;
  }

  @override
  void update(
      void Function(FareRevisionListResponseDtoOutputItemsInnerBeforeBuilder)?
          updates) {
    if (updates != null) updates(this);
  }

  @override
  FareRevisionListResponseDtoOutputItemsInnerBefore build() => _build();

  _$FareRevisionListResponseDtoOutputItemsInnerBefore _build() {
    _$FareRevisionListResponseDtoOutputItemsInnerBefore _$result;
    try {
      _$result = _$v ??
          _$FareRevisionListResponseDtoOutputItemsInnerBefore._(
            routeId: BuiltValueNullFieldError.checkNotNull(
                routeId,
                r'FareRevisionListResponseDtoOutputItemsInnerBefore',
                'routeId'),
            status: BuiltValueNullFieldError.checkNotNull(status,
                r'FareRevisionListResponseDtoOutputItemsInnerBefore', 'status'),
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
            r'FareRevisionListResponseDtoOutputItemsInnerBefore',
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
